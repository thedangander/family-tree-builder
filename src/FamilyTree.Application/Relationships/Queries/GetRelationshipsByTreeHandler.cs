using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Relationships.Queries;

/// <summary>
/// Wolverine handler for GetRelationshipsByTreeQuery.
/// </summary>
public class GetRelationshipsByTreeHandler
{
    private readonly IRelationshipRepository _relationshipRepository;

    public GetRelationshipsByTreeHandler(IRelationshipRepository relationshipRepository)
    {
        _relationshipRepository = relationshipRepository;
    }

    public async Task<IEnumerable<RelationshipDto>> Handle(GetRelationshipsByTreeQuery query, CancellationToken cancellationToken)
    {
        var relationships = await _relationshipRepository.GetByTreeIdAsync(query.TreeId, cancellationToken);
        return relationships.Select(r => r.ToDto());
    }
}
