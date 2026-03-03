using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Interfaces;

/// <summary>
/// Repository interface for User entities.
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User> CreateAsync(User user, CancellationToken cancellationToken = default);
    Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
    Task UpdateLastLoginAsync(string id, CancellationToken cancellationToken = default);
}
