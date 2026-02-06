using System.Data.Common;
using Haven.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace Haven.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrashController : ControllerBase
    {
        private readonly HavenDbContext _db;

        public TrashController(HavenDbContext db)
        {
            _db = db;   
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddTrash([FromBody] List<string> cids)
        {
            int addCount = 0;
            foreach(var cid in cids)
            {
                if(!_db.Trash.Any(t => t.Cid == cid))
                {
                    _db.Trash.Add(new TrashItem{Cid = cid, DeleteAt = DateTime.UtcNow});
                    addCount ++;
                }
            }

            if(addCount > 0)
            {
                await _db.SaveChangesAsync();
            }

            return Ok(new {message = $"marked {addCount} items for deletions."});
        }

        // if you want to call like a forceful delete from the client sid this can be uncommented

        // [HttpDelete("gc")]
        // public async Task<IActionResult> RunGarbageCollector([FromQuery] int minutes = 10)
        // {
        //     var threshold = DateTime.UtcNow.AddMinutes(-minutes);
        //     var oldItems = _db.Trash.Where(trash => trash.DeleteAt < threshold).ToList();

        //     int deleteCount = 0;

        //     foreach (var item in oldItems)
        //     {
        //         var path = Path.Combine("Data", item.Cid);
        //         if (System.IO.File.Exists(path))
        //         {
        //             System.IO.File.Delete(path);
        //             deleteCount++;
        //         }
        //         _db.Remove(item);
        //     }

        //     await _db.SaveChangesAsync();
        //     return Ok(new {deleted = deleteCount, message="garbage collection completed"});
        // }
    }
}
