using System.Net.Http.Json;
using Grpc.Net.Client;
using Izpiti.V1;

AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);

var builder = WebApplication.CreateBuilder(args);

var studentiBase = Environment.GetEnvironmentVariable("STUDENTI_BASE_URL") ?? "http://localhost:8001";
var izpitiAddr = Environment.GetEnvironmentVariable("IZPITI_GRPC_ADDR") ?? "http://localhost:50051";

builder.Services.AddHttpClient("studenti", c => c.BaseAddress = new Uri(studentiBase));

builder.Services.AddSingleton(sp =>
{
    var channel = GrpcChannel.ForAddress(izpitiAddr);
    return new IzpitiService.IzpitiServiceClient(channel);
});

var app = builder.Build();

app.MapGet("/m/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/m/student/{id:int}/status", async (int id, IHttpClientFactory hf) =>
{
    var http = hf.CreateClient("studenti");
    var r = await http.GetAsync($"/studenti/{id}");
    if (!r.IsSuccessStatusCode) return Results.StatusCode((int)r.StatusCode);

    var student = await r.Content.ReadFromJsonAsync<Dictionary<string, object>>();
    return Results.Ok(new { id, status = student?["status"] });
});

app.MapGet("/m/exams/next", async (int? limit, IzpitiService.IzpitiServiceClient grpc) =>
{
    var now = DateTimeOffset.UtcNow;
    var to = now.AddDays(90);

    var resp = await grpc.ListExamTermsAsync(new ListExamTermsRequest
    {
        PredmetId = "",
        Od = now.ToString("o"),
        Do = to.ToString("o"),
        Limit = limit ?? 5,
        Offset = 0
    });

    return Results.Ok(new
    {
        next = resp.Terms.Select(t => new { t.Id, t.PredmetId, t.DatumCas, t.Lokacija })
    });
});

app.MapGet("/m/home", async (int studentId, IHttpClientFactory hf, IzpitiService.IzpitiServiceClient grpc) =>
{
    var http = hf.CreateClient("studenti");
    var r = await http.GetAsync($"/studenti/{studentId}");
    if (!r.IsSuccessStatusCode) return Results.StatusCode((int)r.StatusCode);

    var student = await r.Content.ReadFromJsonAsync<Dictionary<string, object>>();

    var now = DateTimeOffset.UtcNow;
    var to = now.AddDays(30);

    var exams = await grpc.ListExamTermsAsync(new ListExamTermsRequest
    {
        PredmetId = "",
        Od = now.ToString("o"),
        Do = to.ToString("o"),
        Limit = 5,
        Offset = 0
    });

    return Results.Ok(new
    {
        student = new { id = studentId, status = student?["status"], vpisna = student?["vpisna"] },
        nextExams = exams.Terms.Select(t => new { t.Id, t.PredmetId, t.DatumCas, t.Lokacija })
    });
});

app.Run();