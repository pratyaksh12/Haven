using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.VisualBasic;
using System.ComponentModel.DataAnnotations;

namespace Haven.Server.Services;

public class UserRecord
{
    [Key]
    public string Username{get; set;} = "";
    public string SaltHex {get;set;} = "";
    public string PublicKeyHex{get;set;} = "";

    public string? RootCid{get;set;}
}
