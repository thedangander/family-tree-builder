namespace FamilyTree.Application.Trees.Queries;

/// <summary>
/// Query to get all trees owned by a user.
/// </summary>
public record GetTreesByOwnerQuery(string OwnerId);
