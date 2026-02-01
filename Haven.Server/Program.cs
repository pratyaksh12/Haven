using Haven.Core.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
var data = Path.Combine(Directory.GetCurrentDirectory(), "Data");
builder.Services.AddSingleton<IBlockStorage>(new FileBlockStorage(data));

var app = builder.Build();
app.MapControllers();
app.Run();

public partial class Program { }
