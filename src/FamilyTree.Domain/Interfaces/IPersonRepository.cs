using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Interfaces;

/// <summary>
/// Repository interface for Person entities.
/// </summary>
public interface IPersonRepository
{
    Task<Person?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Person>> GetByTreeIdAsync(string treeId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Person>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Person> CreateAsync(Person person, CancellationToken cancellationToken = default);
    Task<Person> UpdateAsync(Person person, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Person>> SearchAsync(string treeId, string searchTerm, CancellationToken cancellationToken = default);
    Task<int> CountByTreeIdAsync(string treeId, CancellationToken cancellationToken = default);
}
