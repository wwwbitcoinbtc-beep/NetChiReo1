#!/bin/bash

set -e

SOLUTION_NAME="NetChi.Api"
API_PROJECT="NetChi.Api"
INFRA_PROJECT="NetChi.Infrastructure"
APPLICATION_PROJECT="NetChi.Application"
DOMAIN_PROJECT="NetChi.Domain"
SHARED_PROJECT="NetChi.Shared"

echo "========================================"
echo "Creating NetChi Solution with .NET 10"
echo "========================================"

# Create solution
dotnet new sln -n "$SOLUTION_NAME" --force

# Create source directory
[ -d "src" ] || mkdir -p "src"
cd src

# Create projects with .NET 10
echo "Creating projects..."
dotnet new webapi -n "$API_PROJECT" --framework net10.0 -f
dotnet new classlib -n "$APPLICATION_PROJECT" --framework net10.0 -f
dotnet new classlib -n "$INFRA_PROJECT" --framework net10.0 -f
dotnet new classlib -n "$DOMAIN_PROJECT" --framework net10.0 -f
dotnet new classlib -n "$SHARED_PROJECT" --framework net10.0 -f

cd ..

# Add projects to solution
echo "Adding projects to solution..."
dotnet sln "$SOLUTION_NAME.sln" add "src/$API_PROJECT/$API_PROJECT.csproj"
dotnet sln "$SOLUTION_NAME.sln" add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj"
dotnet sln "$SOLUTION_NAME.sln" add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj"
dotnet sln "$SOLUTION_NAME.sln" add "src/$DOMAIN_PROJECT/$DOMAIN_PROJECT.csproj"
dotnet sln "$SOLUTION_NAME.sln" add "src/$SHARED_PROJECT/$SHARED_PROJECT.csproj"

# Set project references
echo "Setting up project references..."
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" reference "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj"
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" reference "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj"
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" reference "src/$SHARED_PROJECT/$SHARED_PROJECT.csproj"
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" reference "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj"
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" reference "src/$SHARED_PROJECT/$SHARED_PROJECT.csproj"
dotnet add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj" reference "src/$DOMAIN_PROJECT/$DOMAIN_PROJECT.csproj"
dotnet add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj" reference "src/$SHARED_PROJECT/$SHARED_PROJECT.csproj"

# Install NuGet packages
echo "Installing NuGet packages..."

# Shared Layer
dotnet add "src/$SHARED_PROJECT/$SHARED_PROJECT.csproj" package Microsoft.Extensions.Options

# Domain Layer
dotnet add "src/$DOMAIN_PROJECT/$DOMAIN_PROJECT.csproj" package MediatR.Contracts

# Application Layer
dotnet add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj" package AutoMapper
dotnet add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj" package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj" package FluentValidation.DependencyInjectionExtensions
dotnet add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj" package MediatR
dotnet add "src/$APPLICATION_PROJECT/$APPLICATION_PROJECT.csproj" package Microsoft.Extensions.Logging.Abstractions

# Infrastructure Layer
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" package Microsoft.EntityFrameworkCore.SqlServer
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" package Microsoft.EntityFrameworkCore.Tools
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" package Microsoft.EntityFrameworkCore.Design
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" package Microsoft.Extensions.Configuration.Abstractions
dotnet add "src/$INFRA_PROJECT/$INFRA_PROJECT.csproj" package Microsoft.AspNetCore.SignalR.Core

# API Layer
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package Microsoft.AspNetCore.OpenApi
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package Swashbuckle.AspNetCore
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package Microsoft.AspNetCore.RateLimiting
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package Microsoft.AspNetCore.SignalR
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package Microsoft.AspNetCore.Cors
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package NWebsec.AspNetCore.Middleware
dotnet add "src/$API_PROJECT/$API_PROJECT.csproj" package Microsoft.AspNetCore.HttpOverrides

# Create folder structure
echo "Creating folder structure..."

# Domain
mkdir -p "src/$DOMAIN_PROJECT/Entities"
mkdir -p "src/$DOMAIN_PROJECT/ValueObjects"
mkdir -p "src/$DOMAIN_PROJECT/Enums"
mkdir -p "src/$DOMAIN_PROJECT/Events"
mkdir -p "src/$DOMAIN_PROJECT/Exceptions"
mkdir -p "src/$DOMAIN_PROJECT/Interfaces"

# Application
mkdir -p "src/$APPLICATION_PROJECT/Common/Interfaces"
mkdir -p "src/$APPLICATION_PROJECT/Common/Behaviours"
mkdir -p "src/$APPLICATION_PROJECT/Common/Exceptions"
mkdir -p "src/$APPLICATION_PROJECT/Features/Auth/Commands"
mkdir -p "src/$APPLICATION_PROJECT/Features/Auth/Queries"
mkdir -p "src/$APPLICATION_PROJECT/Features/Orders/Commands"
mkdir -p "src/$APPLICATION_PROJECT/Features/Orders/Queries"
mkdir -p "src/$APPLICATION_PROJECT/Features/Notifications"
mkdir -p "src/$APPLICATION_PROJECT/DTOs/Auth"
mkdir -p "src/$APPLICATION_PROJECT/DTOs/Orders"
mkdir -p "src/$APPLICATION_PROJECT/Mappings"

# Infrastructure
mkdir -p "src/$INFRA_PROJECT/Persistence/Context"
mkdir -p "src/$INFRA_PROJECT/Persistence/Configurations"
mkdir -p "src/$INFRA_PROJECT/Persistence/Repositories"
mkdir -p "src/$INFRA_PROJECT/Identity"
mkdir -p "src/$INFRA_PROJECT/Services/Authentication"
mkdir -p "src/$INFRA_PROJECT/Services/Notification"
mkdir -p "src/$INFRA_PROJECT/Services/RealTime"
mkdir -p "src/$INFRA_PROJECT/ExternalServices"

# Shared
mkdir -p "src/$SHARED_PROJECT/Constants"
mkdir -p "src/$SHARED_PROJECT/Extensions"
mkdir -p "src/$SHARED_PROJECT/Helpers"
mkdir -p "src/$SHARED_PROJECT/Resources"

# API
mkdir -p "src/$API_PROJECT/Controllers/v1"
mkdir -p "src/$API_PROJECT/Middleware"
mkdir -p "src/$API_PROJECT/Hubs"
mkdir -p "src/$API_PROJECT/Filters"
mkdir -p "src/$API_PROJECT/Validators"
mkdir -p "src/$API_PROJECT/Extensions"

echo ""
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. Run: chmod +x setup.sh && ./setup.sh"
echo "3. Configure database connection string"
echo "4. Run: dotnet ef migrations add InitialCreate -p src/$INFRA_PROJECT -s src/$API_PROJECT"
echo "5. Run: dotnet run --project src/$API_PROJECT"
echo ""
