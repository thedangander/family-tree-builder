using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.Trees.Commands;

/// <summary>
/// Command to create a new family tree.
/// </summary>
public record CreateTreeCommand(
    string Name,
    string OwnerId,
    string? Description = null,
    bool IsPublic = false,
    TreeLayout DefaultLayout = TreeLayout.Hierarchical
);
