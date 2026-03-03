using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Interfaces;

/// <summary>
/// Repository interface for Relationship entities.
/// </summary>
public interface IRelationshipRepository
{
    Task<Relationship?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Relationship>> GetByTreeIdAsync(string treeId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Relationship>> GetByPersonIdAsync(string personId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Relationship>> GetBetweenPersonsAsync(string personId1, string personId2, CancellationToken cancellationToken = default);
    Task<Relationship> CreateAsync(Relationship relationship, CancellationToken cancellationToken = default);
    Task<Relationship> UpdateAsync(Relationship relationship, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<bool> DeleteByPersonIdAsync(string personId, CancellationToken cancellationToken = default);
    Task<int> CountByTreeIdAsync(string treeId, CancellationToken cancellationToken = default);
}
