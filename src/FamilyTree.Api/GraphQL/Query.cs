using FamilyTree.Application.DTOs;
using FamilyTree.Application.Persons.Queries;
using FamilyTree.Application.Relationships.Queries;
using FamilyTree.Application.Trees.Queries;
using HotChocolate;
using HotChocolate.Authorization;
using Wolverine;

namespace FamilyTree.Api.GraphQL;

/// <summary>
/// GraphQL Query type containing all read operations.
/// All queries require authentication.
/// </summary>
[Authorize]
public class Query
{
    /// <summary>
    /// Get a family tree by ID.
    /// </summary>
    public async Task<TreeDto?> GetTree(
        [Service] IMessageBus bus,
        string id,
        CancellationToken cancellationToken)
    {
        var result = await bus.InvokeAsync<Application.Common.Result<TreeDto>>(
            new GetTreeQuery(id), 
            cancellationToken);
        return result.IsSuccess ? result.Value : null;
    }

    /// <summary>
    /// Get all trees owned by a user.
    /// </summary>
    public async Task<IEnumerable<TreeDto>> GetTreesByOwner(
        [Service] IMessageBus bus,
        string ownerId,
        CancellationToken cancellationToken)
    {
        return await bus.InvokeAsync<IEnumerable<TreeDto>>(
            new GetTreesByOwnerQuery(ownerId), 
            cancellationToken);
    }

    /// <summary>
    /// Get a person by ID.
    /// </summary>
    public async Task<PersonDto?> GetPerson(
        [Service] IMessageBus bus,
        string id,
        CancellationToken cancellationToken)
    {
        var result = await bus.InvokeAsync<Application.Common.Result<PersonDto>>(
            new GetPersonQuery(id), 
            cancellationToken);
        return result.IsSuccess ? result.Value : null;
    }

    /// <summary>
    /// Get all persons in a family tree.
    /// </summary>
    public async Task<IEnumerable<PersonDto>> GetPersonsByTree(
        [Service] IMessageBus bus,
        string treeId,
        CancellationToken cancellationToken)
    {
        return await bus.InvokeAsync<IEnumerable<PersonDto>>(
            new GetPersonsByTreeQuery(treeId), 
            cancellationToken);
    }

    /// <summary>
    /// Get all relationships in a family tree.
    /// </summary>
    public async Task<IEnumerable<RelationshipDto>> GetRelationshipsByTree(
        [Service] IMessageBus bus,
        string treeId,
        CancellationToken cancellationToken)
    {
        return await bus.InvokeAsync<IEnumerable<RelationshipDto>>(
            new GetRelationshipsByTreeQuery(treeId), 
            cancellationToken);
    }

    /// <summary>
    /// Get all relationships for a person.
    /// </summary>
    public async Task<IEnumerable<RelationshipDto>> GetRelationshipsByPerson(
        [Service] IMessageBus bus,
        string personId,
        CancellationToken cancellationToken)
    {
        return await bus.InvokeAsync<IEnumerable<RelationshipDto>>(
            new GetRelationshipsByPersonQuery(personId), 
            cancellationToken);
    }

    /// <summary>
    /// Get complete family tree data (tree, all persons, all relationships) for graph visualization.
    /// </summary>
    public async Task<FamilyTreeData?> GetFamilyTreeData(
        [Service] IMessageBus bus,
        string treeId,
        CancellationToken cancellationToken)
    {
        var treeResult = await bus.InvokeAsync<Application.Common.Result<TreeDto>>(
            new GetTreeQuery(treeId), 
            cancellationToken);

        if (!treeResult.IsSuccess || treeResult.Value == null)
            return null;

        var persons = await bus.InvokeAsync<IEnumerable<PersonDto>>(
            new GetPersonsByTreeQuery(treeId), 
            cancellationToken);

        var relationships = await bus.InvokeAsync<IEnumerable<RelationshipDto>>(
            new GetRelationshipsByTreeQuery(treeId), 
            cancellationToken);

        return new FamilyTreeData
        {
            Tree = treeResult.Value,
            Persons = persons.ToList(),
            Relationships = relationships.ToList()
        };
    }
}

/// <summary>
/// Combined family tree data for graph visualization.
/// </summary>
public class FamilyTreeData
{
    public TreeDto Tree { get; set; } = null!;
    public List<PersonDto> Persons { get; set; } = new();
    public List<RelationshipDto> Relationships { get; set; } = new();
}
