namespace FamilyTree.Application.Relationships.Queries;

/// <summary>
/// Query to get all relationships for a specific person.
/// </summary>
public record GetRelationshipsByPersonQuery(string PersonId);
