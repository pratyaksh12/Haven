using System;
using Microsoft.EntityFrameworkCore;

namespace Haven.Server.Services;

public class GarbageCollectorService(IServiceProvider serviceProvider, ILogger<GarbageCollectorService> logger) : BackgroundService
{

    private readonly TimeSpan _period = TimeSpan.FromMinutes(10);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Garbage collection initiated....");
        using PeriodicTimer timer = new PeriodicTimer(_period);
        
        while(await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await RunGarbageCollectionAsync(stoppingToken);

            }
            catch(Exception ex)
            {
                logger.LogError(ex,"Unable to complete Garbage Collection");
            }
        }
    }

    private async Task RunGarbageCollectionAsync(CancellationToken stoppingToken)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<HavenDbContext>();

        logger.LogInformation("running garbage collector...");

        // Fetch all items from trash
        var oldItems = await db.Trash.ToListAsync(stoppingToken);

        if(oldItems.Count == 0){ 
            logger.LogInformation("garbage bin is empty");
            return;
        }

        int deleteCount = 0;
        foreach (var item in oldItems)
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", item.Cid);
            if (File.Exists(path))
            {
                try
                {
                    File.Delete(path);
                    deleteCount ++;                    
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, $"Failed to dump the block {item.Cid}");
                    continue;
                }
            }
            db.Trash.Remove(item);
        }

        await db.SaveChangesAsync(stoppingToken);
        logger.LogInformation($"Garbage Collection complete. Deleted {deleteCount} blobs.");

    }


}
