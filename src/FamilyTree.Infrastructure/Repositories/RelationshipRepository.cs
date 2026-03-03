using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;
using MongoDB.Driver;

namespace FamilyTree.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IRelationshipRepository.
/// </summary>
public class RelationshipRepository : IRelationshipRepository
{
    private readonly IMongoCollection<Relationship> _collection;

    public RelationshipRepository(Persistence.MongoDbContext context)
    {
        _collection = context.GetCollection<Relationship>("relationships");
    }

    public async Task<Relationship?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(r => r.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Relationship>> GetByTreeIdAsync(string treeId, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(r => r.TreeId == treeId).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Relationship>> GetByPersonIdAsync(string personId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Relationship>.Filter.Or(
            Builders<Relationship>.Filter.Eq(r => r.FromPersonId, personId),
            Builders<Relationship>.Filter.Eq(r => r.ToPersonId, personId)
        );
        return await _collection.Find(filter).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Relationship>> GetBetweenPersonsAsync(string personId1, string personId2, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Relationship>.Filter.Or(
            Builders<Relationship>.Filter.And(
                Builders<Relationship>.Filter.Eq(r => r.FromPersonId, personId1),
                Builders<Relationship>.Filter.Eq(r => r.ToPersonId, personId2)
            ),
            Builders<Relationship>.Filter.And(
                Builders<Relationship>.Filter.Eq(r => r.FromPersonId, personId2),
                Builders<Relationship>.Filter.Eq(r => r.ToPersonId, personId1)
            )
        );
        return await _collection.Find(filter).ToListAsync(cancellationToken);
    }

    public async Task<Relationship> CreateAsync(Relationship relationship, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(relationship, cancellationToken: cancellationToken);
        return relationship;
    }

    public async Task<Relationship> UpdateAsync(Relationship relationship, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(r => r.Id == relationship.Id, relationship, cancellationToken: cancellationToken);
        return relationship;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(r => r.Id == id, cancellationToken);
        return result.DeletedCount > 0;
    }

    public async Task<bool> DeleteByPersonIdAsync(string personId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Relationship>.Filter.Or(
            Builders<Relationship>.Filter.Eq(r => r.FromPersonId, personId),
            Builders<Relationship>.Filter.Eq(r => r.ToPersonId, personId)
        );
        var result = await _collection.DeleteManyAsync(filter, cancellationToken);
        return result.DeletedCount > 0;
    }

    public async Task<int> CountByTreeIdAsync(string treeId, CancellationToken cancellationToken = default)
    {
        return (int)await _collection.CountDocumentsAsync(r => r.TreeId == treeId, cancellationToken: cancellationToken);
    }
}
