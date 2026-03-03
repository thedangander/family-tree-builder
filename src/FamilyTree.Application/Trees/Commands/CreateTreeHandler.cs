using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Trees.Commands;

/// <summary>
/// Wolverine handler for CreateTreeCommand.
/// </summary>
public class CreateTreeHandler
{
    private readonly ITreeRepository _treeRepository;

    public CreateTreeHandler(ITreeRepository treeRepository)
    {
        _treeRepository = treeRepository;
    }

    public async Task<Result<TreeDto>> Handle(CreateTreeCommand command, CancellationToken cancellationToken)
    {
        var tree = new Tree
        {
            Name = command.Name,
            Description = command.Description,
            OwnerId = command.OwnerId,
            IsPublic = command.IsPublic,
            Settings = new TreeSettings
            {
                DefaultLayout = command.DefaultLayout
            }
        };

        var created = await _treeRepository.CreateAsync(tree, cancellationToken);
        return Result<TreeDto>.Success(created.ToDto());
    }
}
