using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Wolverine handler for AddDocumentToRelationshipCommand.
/// </summary>
public class AddDocumentToRelationshipHandler
{
    private readonly IRelationshipRepository _relationshipRepository;

    public AddDocumentToRelationshipHandler(IRelationshipRepository relationshipRepository)
    {
        _relationshipRepository = relationshipRepository;
    }

    public async Task<Result<RelationshipDto>> Handle(AddDocumentToRelationshipCommand command, CancellationToken cancellationToken)
    {
        var relationship = await _relationshipRepository.GetByIdAsync(command.RelationshipId, cancellationToken);
        if (relationship == null)
        {
            return Result<RelationshipDto>.Failure("Relationship not found");
        }

        var document = new Document
        {
            Name = command.Name,
            Description = command.Description,
            DocumentType = command.DocumentType,
            FileUrl = command.FileUrl,
            MimeType = command.MimeType,
            FileSize = command.FileSize,
            UploadedAt = DateTime.UtcNow
        };

        relationship.Documents.Add(document);
        relationship.UpdatedAt = DateTime.UtcNow;

        var updated = await _relationshipRepository.UpdateAsync(relationship, cancellationToken);
        return Result<RelationshipDto>.Success(updated.ToDto());
    }
}
