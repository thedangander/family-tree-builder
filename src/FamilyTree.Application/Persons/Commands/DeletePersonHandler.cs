using FamilyTree.Application.Common;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Persons.Commands;

/// <summary>
/// Wolverine handler for DeletePersonCommand.
/// </summary>
public class DeletePersonHandler
{
    private readonly IPersonRepository _personRepository;
    private readonly IRelationshipRepository _relationshipRepository;

    public DeletePersonHandler(IPersonRepository personRepository, IRelationshipRepository relationshipRepository)
    {
        _personRepository = personRepository;
        _relationshipRepository = relationshipRepository;
    }

    public async Task<Result<bool>> Handle(DeletePersonCommand command, CancellationToken cancellationToken)
    {
        var person = await _personRepository.GetByIdAsync(command.Id, cancellationToken);
        if (person == null)
        {
            return Result<bool>.Failure("Person not found");
        }

        // Delete all relationships involving this person
        await _relationshipRepository.DeleteByPersonIdAsync(command.Id, cancellationToken);

        // Delete the person
        await _personRepository.DeleteAsync(command.Id, cancellationToken);

        return Result<bool>.Success(true);
    }
}
