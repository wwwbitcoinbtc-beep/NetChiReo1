using NetChi.Domain.Entities;
using NetChi.Domain.Enums;
using NetChi.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace NetChi.Api.Extensions;

public static class DatabaseSeeding
{
    public static async Task SeedDatabaseAsync(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            try
            {
                // Ensure database is created
                await context.Database.EnsureCreatedAsync();
                
                // Apply pending migrations
                var migrations = await context.Database.GetPendingMigrationsAsync();
                if (migrations.Any())
                {
                    Console.WriteLine("📝 Applying database migrations...");
                    await context.Database.MigrateAsync();
                    Console.WriteLine("✓ Migrations applied successfully");
                }

                // Seed sample data if database is empty
                if (!context.Users.Any())
                {
                    Console.WriteLine("📊 Seeding sample data...");

                    // Create admin user
                    var admin = new User
                    {
                        Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440001"),
                        UserName = "admin_user",
                        Email = "admin@netchicafe.ir",
                        PasswordHash = "HASH_PASSWORD_ADMIN_123",
                        IsActive = true,
                        Type = UserType.Admin,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Create customer 1
                    var customer1 = new User
                    {
                        Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440002"),
                        UserName = "customer_1",
                        Email = "customer1@netchicafe.ir",
                        PasswordHash = "HASH_PASSWORD_USER_123",
                        IsActive = true,
                        Type = UserType.Customer,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Create customer 2
                    var customer2 = new User
                    {
                        Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440003"),
                        UserName = "customer_2",
                        Email = "customer2@netchicafe.ir",
                        PasswordHash = "HASH_PASSWORD_USER_456",
                        IsActive = true,
                        Type = UserType.Customer,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Create service provider
                    var provider = new User
                    {
                        Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440004"),
                        UserName = "provider_1",
                        Email = "provider@netchicafe.ir",
                        PasswordHash = "HASH_PASSWORD_PROV_789",
                        IsActive = true,
                        Type = UserType.ServiceProvider,
                        CreatedAt = DateTime.UtcNow
                    };

                    context.Users.AddRange(admin, customer1, customer2, provider);
                    await context.SaveChangesAsync();
                    Console.WriteLine($"✓ 4 sample users created");

                    // Create sample orders
                    var order1 = new Order
                    {
                        Id = Guid.Parse("650e8400-e29b-41d4-a716-446655440001"),
                        UserId = customer1.Id,
                        OrderNumber = "ORD-001",
                        Description = "Test order 1",
                        Amount = 150000m,
                        Status = OrderStatus.Pending,
                        CreatedAt = DateTime.UtcNow.AddDays(-7)
                    };

                    var order2 = new Order
                    {
                        Id = Guid.Parse("650e8400-e29b-41d4-a716-446655440002"),
                        UserId = customer1.Id,
                        OrderNumber = "ORD-002",
                        Description = "Test order 2",
                        Amount = 250000m,
                        Status = OrderStatus.Completed,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    };

                    var order3 = new Order
                    {
                        Id = Guid.Parse("650e8400-e29b-41d4-a716-446655440003"),
                        UserId = customer2.Id,
                        OrderNumber = "ORD-003",
                        Description = "Test order 3",
                        Amount = 350000m,
                        Status = OrderStatus.Pending,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    };

                    var order4 = new Order
                    {
                        Id = Guid.Parse("650e8400-e29b-41d4-a716-446655440004"),
                        UserId = customer2.Id,
                        OrderNumber = "ORD-004",
                        Description = "Test order 4",
                        Amount = 175000m,
                        Status = OrderStatus.Completed,
                        CreatedAt = DateTime.UtcNow.AddHours(-12)
                    };

                    context.Orders.AddRange(order1, order2, order3, order4);
                    await context.SaveChangesAsync();
                    Console.WriteLine($"✓ 4 sample orders created");

                    Console.WriteLine("✅ Database seeding complete!");
                }
                else
                {
                    Console.WriteLine("✓ Database already has data, skipping seed");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Database seeding error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }
    }
}
