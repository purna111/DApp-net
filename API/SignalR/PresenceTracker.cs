using System;

namespace API.SignalR;

public class PresenceTracker
{
    private static readonly Dictionary<string, List<string>> OnlineUsers = [];

    public Task<bool> UserConnected(string username, string connectionId)
    {
        var isOnline = false;
        //lock - to get thread safe
        lock (OnlineUsers) 
        {
            if (OnlineUsers.ContainsKey(username))
            {
                OnlineUsers[username].Add(connectionId);
            }
            else 
            {
                OnlineUsers.Add(username, [connectionId]);
                isOnline = true;
            }
        }

        return Task.FromResult(isOnline);
    }

    public Task<bool> UserDisconnected(string username, string connectionId)
    {
        var isOffline = false;
        lock (OnlineUsers)
        {
            if (!OnlineUsers.ContainsKey(username)) return Task.FromResult(isOffline);
            // removing the particular device connetion ig
            OnlineUsers[username].Remove(connectionId);
            // when all devices of particular count is 0 then we remove the user
            if (OnlineUsers[username].Count == 0)
            {
                OnlineUsers.Remove(username);
                isOffline = true;
            }
        }

        return Task.FromResult(isOffline);
    }

    public Task<string[]> GetOnlineUsers() 
    {
        string[] onlineUsers;
        lock(OnlineUsers)
        {
            onlineUsers = OnlineUsers.OrderBy(k => k.Key).Select(k => k.Key).ToArray();
        }

        return Task.FromResult(onlineUsers);
    }
    // get all the connections for the specified user
    public static Task<List<string>> GetConnectionsForUser(string username)
    {
        List<string> connectionIds;

        if (OnlineUsers.TryGetValue(username, out var connections))
        {
            lock(connections) 
            {
                connectionIds = connections.ToList();
            }
        }
        else 
        {
            connectionIds = [];
        }

        return Task.FromResult(connectionIds);
    }

}
