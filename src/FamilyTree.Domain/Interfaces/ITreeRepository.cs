using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Interfaces;

/// <summary>
/// Repository interface for Tree entities.
/// </summary>
public interface ITreeRepository
{
    Task<Tree?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tree>> GetByOwnerIdAsync(string ownerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tree>> GetSharedWithUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tree>> GetPublicTreesAsync(int skip = 0, int take = 20, CancellationToken cancellationToken = default);
    Task<Tree> CreateAsync(Tree tree, CancellationToken cancellationToken = default);
    Task<Tree> UpdateAsync(Tree tree, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<bool> AddShareAsync(string treeId, TreeShare share, CancellationToken cancellationToken = default);
    Task<bool> RemoveShareAsync(string treeId, string userId, CancellationToken cancellationToken = default);
}
