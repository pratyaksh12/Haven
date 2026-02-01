using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.VisualBasic;

namespace Haven.Server.Services;

public class UserRecord
{
    public string Username{get; set;} = "";
    public string SaltHex {get;set;} = "";
    public string PublicKeyHex{get;set;} = "";
}

public class UserRepository
{
    private readonly string _filePath;
    private Dictionary<string, UserRecord> _users = new();

    public UserRepository(string dataPath)
    {
        _filePath = Path.Combine(dataPath, "user.json");
        Load();
    }

    public void Save(UserRecord user)
    {
        _users[user.Username] = user;
        var json = JsonSerializer.Serialize(_users.Values);
        File.WriteAllText(_filePath, json);
    }

    public UserRecord? Get(string userName)
    {
        _users.TryGetValue(userName, out var user);
        return user;
    }

    private void Load()
    {
        if (File.Exists(_filePath))
        {
            var json = File.ReadAllText(_filePath);
            var list = JsonSerializer.Deserialize<List<UserRecord>>(json) ?? new();
            _users = list.ToDictionary(u => u.Username);
        }
    }
}