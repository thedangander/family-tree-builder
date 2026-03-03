namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Command to update an existing relationship.
/// </summary>
public record UpdateRelationshipCommand(
    string Id,
    DateTime? StartDate,
    DateTime? EndDate,
    string? Notes
);
