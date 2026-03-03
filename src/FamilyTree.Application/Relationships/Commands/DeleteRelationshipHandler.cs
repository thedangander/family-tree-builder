using FamilyTree.Application.Common;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Wolverine handler for DeleteRelationshipCommand.
/// </summary>
public class DeleteRelationshipHandler
{
    private readonly IRelationshipRepository _relationshipRepository;

    public DeleteRelationshipHandler(IRelationshipRepository relationshipRepository)
    {
        _relationshipRepository = relationshipRepository;
    }

    public async Task<Result<bool>> Handle(DeleteRelationshipCommand command, CancellationToken cancellationToken)
    {
        var relationship = await _relationshipRepository.GetByIdAsync(command.Id, cancellationToken);
        if (relationship == null)
        {
            return Result<bool>.Failure("Relationship not found");
        }

        await _relationshipRepository.DeleteAsync(command.Id, cancellationToken);
        return Result<bool>.Success(true);
    }
}
