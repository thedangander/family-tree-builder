namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Command to remove a document from a relationship.
/// </summary>
public record RemoveDocumentFromRelationshipCommand(
    string RelationshipId,
    string DocumentId
);
