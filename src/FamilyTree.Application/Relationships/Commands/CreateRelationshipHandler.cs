using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Wolverine handler for CreateRelationshipCommand.
/// </summary>
public class CreateRelationshipHandler
{
    private readonly IRelationshipRepository _relationshipRepository;
    private readonly IPersonRepository _personRepository;

    public CreateRelationshipHandler(
        IRelationshipRepository relationshipRepository, 
        IPersonRepository personRepository)
    {
        _relationshipRepository = relationshipRepository;
        _personRepository = personRepository;
    }

    public async Task<Result<RelationshipDto>> Handle(CreateRelationshipCommand command, CancellationToken cancellationToken)
    {
        // Validate persons exist
        var fromPerson = await _personRepository.GetByIdAsync(command.FromPersonId, cancellationToken);
        if (fromPerson == null)
        {
            return Result<RelationshipDto>.Failure("From person not found");
        }

        var toPerson = await _personRepository.GetByIdAsync(command.ToPersonId, cancellationToken);
        if (toPerson == null)
        {
            return Result<RelationshipDto>.Failure("To person not found");
        }

        // Ensure both persons belong to the same tree
        if (fromPerson.TreeId != command.TreeId || toPerson.TreeId != command.TreeId)
        {
            return Result<RelationshipDto>.Failure("Both persons must belong to the same tree");
        }

        var relationship = new Relationship
        {
            TreeId = command.TreeId,
            FromPersonId = command.FromPersonId,
            ToPersonId = command.ToPersonId,
            RelationshipType = command.RelationshipType,
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            Notes = command.Notes
        };

        var created = await _relationshipRepository.CreateAsync(relationship, cancellationToken);
        return Result<RelationshipDto>.Success(created.ToDto());
    }
}
