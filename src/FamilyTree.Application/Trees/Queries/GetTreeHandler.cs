using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Trees.Queries;

/// <summary>
/// Wolverine handler for GetTreeQuery.
/// </summary>
public class GetTreeHandler
{
    private readonly ITreeRepository _treeRepository;

    public GetTreeHandler(ITreeRepository treeRepository)
    {
        _treeRepository = treeRepository;
    }

    public async Task<Result<TreeDto>> Handle(GetTreeQuery query, CancellationToken cancellationToken)
    {
        var tree = await _treeRepository.GetByIdAsync(query.Id, cancellationToken);
        if (tree == null)
        {
            return Result<TreeDto>.Failure("Tree not found");
        }

        return Result<TreeDto>.Success(tree.ToDto());
    }
}
