using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;
using MongoDB.Driver;

namespace FamilyTree.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IPersonRepository.
/// </summary>
public class PersonRepository : IPersonRepository
{
    private readonly IMongoCollection<Person> _collection;

    public PersonRepository(Persistence.MongoDbContext context)
    {
        _collection = context.GetCollection<Person>("persons");
    }

    public async Task<Person?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(p => p.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Person>> GetByTreeIdAsync(string treeId, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(p => p.TreeId == treeId).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Person>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _collection.Find(_ => true).ToListAsync(cancellationToken);
    }

    public async Task<Person> CreateAsync(Person person, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(person, cancellationToken: cancellationToken);
        return person;
    }

    public async Task<Person> UpdateAsync(Person person, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(p => p.Id == person.Id, person, cancellationToken: cancellationToken);
        return person;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(p => p.Id == id, cancellationToken);
        return result.DeletedCount > 0;
    }

    public async Task<IEnumerable<Person>> SearchAsync(string treeId, string searchTerm, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Person>.Filter.And(
            Builders<Person>.Filter.Eq(p => p.TreeId, treeId),
            Builders<Person>.Filter.Or(
                Builders<Person>.Filter.Regex(p => p.FirstName, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Person>.Filter.Regex(p => p.LastName, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            )
        );
        return await _collection.Find(filter).ToListAsync(cancellationToken);
    }

    public async Task<int> CountByTreeIdAsync(string treeId, CancellationToken cancellationToken = default)
    {
        return (int)await _collection.CountDocumentsAsync(p => p.TreeId == treeId, cancellationToken: cancellationToken);
    }
}
