using System;
using Microsoft.EntityFrameworkCore;

namespace Haven.Server.Services;

public class HavenDbContext(DbContextOptions<HavenDbContext> options) : DbContext(options)
{
    public DbSet<UserRecord> Users{get; set;}
}
