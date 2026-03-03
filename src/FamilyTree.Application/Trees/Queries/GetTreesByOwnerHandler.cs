using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Trees.Queries;

/// <summary>
/// Wolverine handler for GetTreesByOwnerQuery.
/// </summary>
public class GetTreesByOwnerHandler
{
    private readonly ITreeRepository _treeRepository;

    public GetTreesByOwnerHandler(ITreeRepository treeRepository)
    {
        _treeRepository = treeRepository;
    }

    public async Task<IEnumerable<TreeDto>> Handle(GetTreesByOwnerQuery query, CancellationToken cancellationToken)
    {
        var trees = await _treeRepository.GetByOwnerIdAsync(query.OwnerId, cancellationToken);
        return trees.Select(t => t.ToDto());
    }
}
