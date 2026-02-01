using System.Security.Cryptography.X509Certificates;
using Haven.Core.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Haven.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlockController : ControllerBase
    {
        private readonly IBlockStorage _storage;

        public BlockController(IBlockStorage storage)
        {
            _storage = storage;
        }

        // Upload the file and get the cid back
        [HttpPost]
        public async Task<IActionResult> PutData()
        {
            using var ms = new MemoryStream();
            await Request.Body.CopyToAsync(ms);
            var data =  ms.ToArray();

            if(data.Length == 0) return BadRequest("Empty Block of data you cranzy");

            var hash = await _storage.PutAsync(data);
            var cid = Convert.ToHexStringLower(hash);

            return Ok(new{message = "data stored and secured successfully", cid});
        }

        // Download the data from Cid
        [HttpGet("{cid}")]
        public async Task<IActionResult> GetData(string cid)
        {
            try
            {                
                var hash = Convert.FromHexString(cid);
                var data = await _storage.GetAsync(hash);

               

                return File(data, "application/octet-stream");
            }
            catch(FileNotFoundException)
            {
                return NotFound("You seem to be high for finding something that doesn't exists...");
            }
            catch (FormatException)
            {
                return BadRequest("Thats not what I asked for, you prick. Give me the correct CID format");
            }
        }
    }

}
