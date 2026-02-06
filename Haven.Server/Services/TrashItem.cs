using System;
using System.ComponentModel.DataAnnotations;

namespace Haven.Server.Services;

public class TrashItem
{
    [Key]
    public required string Cid { get; set; }
}
