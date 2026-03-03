using FamilyTree.Application.Common;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Trees.Commands;

/// <summary>
/// Wolverine handler for DeleteTreeCommand.
/// </summary>
public class DeleteTreeHandler
{
    private readonly ITreeRepository _treeRepository;
    private readonly IPersonRepository _personRepository;
    private readonly IRelationshipRepository _relationshipRepository;

    public DeleteTreeHandler(
        ITreeRepository treeRepository, 
        IPersonRepository personRepository,
        IRelationshipRepository relationshipRepository)
    {
        _treeRepository = treeRepository;
        _personRepository = personRepository;
        _relationshipRepository = relationshipRepository;
    }

    public async Task<Result> Handle(DeleteTreeCommand command, CancellationToken cancellationToken)
    {
        var tree = await _treeRepository.GetByIdAsync(command.Id, cancellationToken);
        if (tree == null)
        {
            return Result.Failure("Tree not found");
        }

        // Get all persons in the tree and delete their relationships
        var persons = await _personRepository.GetByTreeIdAsync(command.Id, cancellationToken);
        foreach (var person in persons)
        {
            await _relationshipRepository.DeleteByPersonIdAsync(person.Id, cancellationToken);
            await _personRepository.DeleteAsync(person.Id, cancellationToken);
        }

        // Delete the tree
        await _treeRepository.DeleteAsync(command.Id, cancellationToken);

        return Result.Success();
    }
}
