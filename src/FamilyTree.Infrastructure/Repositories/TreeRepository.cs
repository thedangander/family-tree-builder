using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;
using MongoDB.Driver;

namespace FamilyTree.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of ITreeRepository.
/// </summary>
public class TreeRepository : ITreeRepository
{
    private readonly IMongoCollection<Tree> _collection;

    public TreeRepository(Persistence.MongoDbContext context)
    {
        _collection = context.GetCollection<Tree>("trees");
    }

    public async Task<Tree?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(t => t.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Tree>> GetByOwnerIdAsync(string ownerId, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(t => t.OwnerId == ownerId).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Tree>> GetSharedWithUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Tree>.Filter.ElemMatch(t => t.SharedWith, s => s.UserId == userId);
        return await _collection.Find(filter).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Tree>> GetPublicTreesAsync(int skip = 0, int take = 20, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(t => t.IsPublic)
            .Skip(skip)
            .Limit(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<Tree> CreateAsync(Tree tree, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(tree, cancellationToken: cancellationToken);
        return tree;
    }

    public async Task<Tree> UpdateAsync(Tree tree, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(t => t.Id == tree.Id, tree, cancellationToken: cancellationToken);
        return tree;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(t => t.Id == id, cancellationToken);
        return result.DeletedCount > 0;
    }

    public async Task<bool> AddShareAsync(string treeId, TreeShare share, CancellationToken cancellationToken = default)
    {
        var update = Builders<Tree>.Update.Push(t => t.SharedWith, share);
        var result = await _collection.UpdateOneAsync(t => t.Id == treeId, update, cancellationToken: cancellationToken);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> RemoveShareAsync(string treeId, string userId, CancellationToken cancellationToken = default)
    {
        var update = Builders<Tree>.Update.PullFilter(t => t.SharedWith, s => s.UserId == userId);
        var result = await _collection.UpdateOneAsync(t => t.Id == treeId, update, cancellationToken: cancellationToken);
        return result.ModifiedCount > 0;
    }
}
