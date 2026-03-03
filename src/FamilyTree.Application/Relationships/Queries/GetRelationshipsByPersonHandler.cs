using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Relationships.Queries;

/// <summary>
/// Wolverine handler for GetRelationshipsByPersonQuery.
/// </summary>
public class GetRelationshipsByPersonHandler
{
    private readonly IRelationshipRepository _relationshipRepository;

    public GetRelationshipsByPersonHandler(IRelationshipRepository relationshipRepository)
    {
        _relationshipRepository = relationshipRepository;
    }

    public async Task<IEnumerable<RelationshipDto>> Handle(GetRelationshipsByPersonQuery query, CancellationToken cancellationToken)
    {
        var relationships = await _relationshipRepository.GetByPersonIdAsync(query.PersonId, cancellationToken);
        return relationships.Select(r => r.ToDto());
    }
}
