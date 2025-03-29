#pragma warning disable 

using ClaimRequest.AI;
using ClaimRequest.API.Extensions;
using ClaimRequest.API.Middlewares;
using ClaimRequest.API.Services;
using ClaimRequest.BLL.Services;
using ClaimRequest.BLL.Services.Implements;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.Claim;
using ClaimRequest.DAL.Repositories.Implements;
using ClaimRequest.DAL.Repositories.Interfaces;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.SemanticKernel;
using System.Text;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);
// Add services to the container.

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ClaimRequest.API",
        Version = "v1",
        Description = "A Claim Request System Project"
    });
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter your token:"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = JwtBearerDefaults.AuthenticationScheme
                }
            },
            new List<string>()
        }
    });
});

// deploy db
builder.Services.AddDbContext<ClaimRequestDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("SupabaseConnection"),
        npgsqlOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorCodesToAdd: null);
        });
});

// connect to local db
//builder.Services.AddDbContext<ClaimRequestDbContext>(options =>
//{
//    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection"),
//        npgsqlOptionsAction: sqlOptions =>
//        {
//            sqlOptions.EnableRetryOnFailure(
//                maxRetryCount: 5,
//                maxRetryDelay: TimeSpan.FromSeconds(30),
//                errorCodesToAdd: null);
//        });
//});


builder.Services.AddHangfire(config => config
.UseSimpleAssemblyNameTypeSerializer()
.UseRecommendedSerializerSettings()
.UseStorage(new PostgreSqlStorage(builder.Configuration.GetConnectionString("SupabaseConnection"), new PostgreSqlStorageOptions
{
    SchemaName = "hangfire",
    PrepareSchemaIfNecessary = true,
    JobExpirationCheckInterval = TimeSpan.FromHours(4),
    InvisibilityTimeout = TimeSpan.FromDays(1), //?n job trong vòng 24 ti?ng
}))
.UseFilter(new AutomaticRetryAttribute { Attempts = 3 }));


builder.Services.AddHangfireServer();

// Add services to the container.
//builder.Services.AddAutoMapper(typeof(AutoMapperProfile).Assembly);
// tat ca cac service implement tu Profile cuar AutoMapperProfile se duoc tu dong add vao
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Add IUnitOfWork and UnitOfWork
builder.Services.AddScoped<IUnitOfWork<ClaimRequestDbContext>, UnitOfWork<ClaimRequestDbContext>>();

// Add this line before registering your services
builder.Services.AddHttpContextAccessor();

//

// Dependency Injection for Repositories and Services
builder.Services.AddScoped<IClaimService, ClaimService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<CloudinaryService>();

builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IClaimExportService, ClaimExportService>();
builder.Services.AddScoped<IExcelConstants, ExcelConstants>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordRecoveryService, PasswordRecoveryService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmailServiceFactory, EmailServiceFactory>();

// Convert enum to string 
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// disable the default ModelStateInvalidFilter => to use the custom ExceptionHandlerMiddleware
// neu dinh chuong khong doc duoc loi tu swagger => comment lai doan code phia duoi
// ===============================================
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});
// ===============================================

// Add authentication
// Update JWT configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuers = builder.Configuration.GetSection("Jwt:ValidIssuers").Get<string[]>()
                           ?? new[] { "http://localhost:5000", "https://localhost:5001", "http://localhost:5173", "https://crsojt.azurewebsites.net" },
            ValidAudiences = builder.Configuration.GetSection("Jwt:ValidAudiences").Get<string[]>()
                             ?? new[] { "http://localhost:5000", "https://localhost:5001", "http://localhost:5173", "https://crs-rust.vercel.app" },
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key is not configured"))),
        };
    });

// After AddAuthentication
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole(SystemRole.Admin.ToString()));
    options.AddPolicy("RequireProjectManagerRole", policy =>
        policy.RequireRole(SystemRole.Approver.ToString()));
    options.AddPolicy("RequireFinanceRole", policy =>
        policy.RequireRole(SystemRole.Finance.ToString()));
    options.AddPolicy("RequireStaffRole", policy =>
        policy.RequireRole(SystemRole.Staff.ToString()));
});

// Register Model for Semantic Kernel
var kernelBuilder = builder.Services.AddKernel();
kernelBuilder.Services.AddGoogleAIGeminiChatCompletion(
    builder.Configuration.GetSection("AI:ChatCompletionModel:Name").Get<string>(),
    builder.Configuration.GetSection("AI:ChatCompletionModel:APIKey").Get<string>());
kernelBuilder.Services.AddGoogleAIEmbeddingGeneration(
    builder.Configuration.GetSection("AI:EmbeddingModel:Name").Get<string>(),
    builder.Configuration.GetSection("AI:EmbeddingModel:APIKey").Get<string>());
kernelBuilder.Services.AddMongoDBVectorStore(
    builder.Configuration.GetSection("AI:VectorDatabase:ConnectionString").Get<string>(),
    builder.Configuration.GetSection("AI:VectorDatabase:DatabaseName").Get<string>()
    );

kernelBuilder.Services.AddScoped<IRAGChatService, RAGChatService>();
// Update the Kestrel configuration
//builder.WebHost.ConfigureKestrel(serverOptions =>
//{
//    if (builder.Environment.IsDevelopment())
//    {
//        // Development configuration (including Docker)
//        serverOptions.ListenAnyIP(5000); // HTTP
//        serverOptions.ListenAnyIP(5001, listenOptions =>
//        {
//            listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http1AndHttp2;
//        });
//    }
//});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Only apply migrations if explicitly enabled in configuration
    if (builder.Configuration.GetValue<bool>("ApplyMigrations", false))
    {
        app.ApplyMigrations();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

// Add the ExceptionHandlerMiddleware to the pipeline
// comment lai doan code phia duoi neu chuong khong doc duoc loi tu swagger
// ===============================================
app.UseMiddleware<ExceptionHandlerMiddleware>();
// ===============================================

app.UseHttpsRedirection();

app.UseCors(options =>
{
    options.SetIsOriginAllowed(origin =>
            origin.StartsWith("http://localhost:") || origin.StartsWith("https://localhost:") || origin == "https://crs-rust.vercel.app")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
});

app.UseHangfireDashboard("/hangfire");

RecurringJob.AddOrUpdate<EmailService>(emailJob => emailJob.SendEmailReminder(), Cron.Daily(1));


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();