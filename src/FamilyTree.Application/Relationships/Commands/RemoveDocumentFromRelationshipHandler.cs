using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Wolverine handler for RemoveDocumentFromRelationshipCommand.
/// </summary>
public class RemoveDocumentFromRelationshipHandler
{
    private readonly IRelationshipRepository _relationshipRepository;

    public RemoveDocumentFromRelationshipHandler(IRelationshipRepository relationshipRepository)
    {
        _relationshipRepository = relationshipRepository;
    }

    public async Task<Result<RelationshipDto>> Handle(RemoveDocumentFromRelationshipCommand command, CancellationToken cancellationToken)
    {
        var relationship = await _relationshipRepository.GetByIdAsync(command.RelationshipId, cancellationToken);
        if (relationship == null)
        {
            return Result<RelationshipDto>.Failure("Relationship not found");
        }

        var document = relationship.Documents.FirstOrDefault(d => d.Id == command.DocumentId);
        if (document == null)
        {
            return Result<RelationshipDto>.Failure("Document not found");
        }

        relationship.Documents.Remove(document);
        relationship.UpdatedAt = DateTime.UtcNow;

        var updated = await _relationshipRepository.UpdateAsync(relationship, cancellationToken);
        return Result<RelationshipDto>.Success(updated.ToDto());
    }
}
