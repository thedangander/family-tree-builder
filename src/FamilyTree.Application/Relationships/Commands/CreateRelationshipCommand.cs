using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Command to create a relationship between two persons.
/// </summary>
public record CreateRelationshipCommand(
    string TreeId,
    string FromPersonId,
    string ToPersonId,
    RelationshipType RelationshipType,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string? Notes = null
);
