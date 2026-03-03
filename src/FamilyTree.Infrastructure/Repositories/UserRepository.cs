using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;
using MongoDB.Driver;

namespace FamilyTree.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IUserRepository.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _collection;

    public UserRepository(Persistence.MongoDbContext context)
    {
        _collection = context.GetCollection<User>("users");
    }

    public async Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(u => u.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(u => u.Email == email).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(user, cancellationToken: cancellationToken);
        return user;
    }

    public async Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);
        return user;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(u => u.Id == id, cancellationToken);
        return result.DeletedCount > 0;
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(u => u.Email == email).AnyAsync(cancellationToken);
    }

    public async Task UpdateLastLoginAsync(string id, CancellationToken cancellationToken = default)
    {
        var update = Builders<User>.Update.Set(u => u.LastLoginAt, DateTime.UtcNow);
        await _collection.UpdateOneAsync(u => u.Id == id, update, cancellationToken: cancellationToken);
    }
}
