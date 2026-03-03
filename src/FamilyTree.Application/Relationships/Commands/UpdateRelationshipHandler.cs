using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Wolverine handler for UpdateRelationshipCommand.
/// </summary>
public class UpdateRelationshipHandler
{
    private readonly IRelationshipRepository _relationshipRepository;

    public UpdateRelationshipHandler(IRelationshipRepository relationshipRepository)
    {
        _relationshipRepository = relationshipRepository;
    }

    public async Task<Result<RelationshipDto>> Handle(UpdateRelationshipCommand command, CancellationToken cancellationToken)
    {
        var relationship = await _relationshipRepository.GetByIdAsync(command.Id, cancellationToken);
        if (relationship == null)
        {
            return Result<RelationshipDto>.Failure("Relationship not found");
        }

        // Update fields - null means don't change, use a marker for clearing
        // For dates, we need to handle clearing explicitly
        if (command.StartDate.HasValue)
        {
            relationship.StartDate = command.StartDate.Value == DateTime.MinValue ? null : command.StartDate.Value;
        }
        
        if (command.EndDate.HasValue)
        {
            relationship.EndDate = command.EndDate.Value == DateTime.MinValue ? null : command.EndDate.Value;
        }
        
        if (command.Notes != null)
        {
            relationship.Notes = string.IsNullOrEmpty(command.Notes) ? null : command.Notes;
        }

        relationship.UpdatedAt = DateTime.UtcNow;

        var updated = await _relationshipRepository.UpdateAsync(relationship, cancellationToken);
        return Result<RelationshipDto>.Success(updated.ToDto());
    }
}
