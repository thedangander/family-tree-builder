using FamilyTree.Application.DTOs;
using FamilyTree.Application.Persons.Commands;
using FamilyTree.Application.Relationships.Commands;
using FamilyTree.Application.Trees.Commands;
using FamilyTree.Domain.Entities;
using HotChocolate;
using HotChocolate.Authorization;
using Wolverine;
using AppResult = FamilyTree.Application.Common;

namespace FamilyTree.Api.GraphQL;

/// <summary>
/// GraphQL Mutation type containing all write operations.
/// All mutations require authentication.
/// </summary>
[Authorize]
public class Mutation
{
    // Helper method to parse date strings
    private static DateTime? ParseDate(string? dateString) =>
        string.IsNullOrWhiteSpace(dateString) ? null : DateTime.Parse(dateString);

    // ==================== Tree Mutations ====================

    /// <summary>
    /// Create a new family tree.
    /// </summary>
    public async Task<MutationResult<TreeDto>> CreateTree(
        [Service] IMessageBus bus,
        CreateTreeInput input,
        CancellationToken cancellationToken)
    {
        var command = new CreateTreeCommand(
            input.Name,
            input.OwnerId,
            input.Description,
            input.IsPublic ?? false,
            input.DefaultLayout ?? TreeLayout.Hierarchical);

        var result = await bus.InvokeAsync<AppResult.Result<TreeDto>>(command, cancellationToken);
        
        return new MutationResult<TreeDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }

    /// <summary>
    /// Update an existing family tree.
    /// </summary>
    public async Task<MutationResult<TreeDto>> UpdateTree(
        [Service] IMessageBus bus,
        UpdateTreeInput input,
        CancellationToken cancellationToken)
    {
        var command = new UpdateTreeCommand(
            input.Id,
            input.Name,
            input.Description,
            input.IsPublic,
            input.RootPersonId,
            input.DefaultLayout,
            input.ShowPhotos,
            input.ShowDates,
            input.ColorScheme,
            input.ZoomLevel,
            input.CenterX,
            input.CenterY);

        var result = await bus.InvokeAsync<AppResult.Result<TreeDto>>(command, cancellationToken);
        
        return new MutationResult<TreeDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }

    /// <summary>
    /// Delete a family tree.
    /// </summary>
    public async Task<MutationResult<bool>> DeleteTree(
        [Service] IMessageBus bus,
        string id,
        CancellationToken cancellationToken)
    {
        var result = await bus.InvokeAsync<AppResult.Result<bool>>(new DeleteTreeCommand(id), cancellationToken);
        
        return new MutationResult<bool>
        {
            Success = result.IsSuccess,
            Data = result.IsSuccess,
            Error = result.Error
        };
    }

    // ==================== Person Mutations ====================

    /// <summary>
    /// Create a new person in a family tree.
    /// </summary>
    public async Task<MutationResult<PersonDto>> CreatePerson(
        [Service] IMessageBus bus,
        CreatePersonInput input,
        CancellationToken cancellationToken)
    {
        var command = new CreatePersonCommand(
            input.TreeId,
            input.FirstName,
            input.LastName,
            input.Gender,
            input.MaidenName,
            ParseDate(input.DateOfBirth),
            ParseDate(input.DateOfDeath),
            input.PlaceOfBirth,
            input.PlaceOfDeath,
            input.Biography,
            input.PhotoUrl,
            input.Occupation,
            input.Email,
            input.Phone,
            input.PositionX ?? 0,
            input.PositionY ?? 0);

        var result = await bus.InvokeAsync<AppResult.Result<PersonDto>>(command, cancellationToken);
        
        return new MutationResult<PersonDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }

    /// <summary>
    /// Update an existing person.
    /// </summary>
    public async Task<MutationResult<PersonDto>> UpdatePerson(
        [Service] IMessageBus bus,
        UpdatePersonInput input,
        CancellationToken cancellationToken)
    {
        var command = new UpdatePersonCommand(
            input.Id,
            input.FirstName,
            input.LastName,
            input.MaidenName,
            input.Gender,
            ParseDate(input.DateOfBirth),
            ParseDate(input.DateOfDeath),
            input.PlaceOfBirth,
            input.PlaceOfDeath,
            input.Biography,
            input.PhotoUrl,
            input.Occupation,
            input.Email,
            input.Phone,
            null,
            null);

        var result = await bus.InvokeAsync<AppResult.Result<PersonDto>>(command, cancellationToken);
        
        return new MutationResult<PersonDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }

    /// <summary>
    /// Delete a person from a family tree.
    /// </summary>
    public async Task<MutationResult<bool>> DeletePerson(
        [Service] IMessageBus bus,
        string id,
        CancellationToken cancellationToken)
    {
        var result = await bus.InvokeAsync<AppResult.Result<bool>>(new DeletePersonCommand(id), cancellationToken);
        
        return new MutationResult<bool>
        {
            Success = result.IsSuccess,
            Data = result.IsSuccess,
            Error = result.Error
        };
    }

    // ==================== Relationship Mutations ====================

    /// <summary>
    /// Create a relationship between two persons.
    /// </summary>
    public async Task<MutationResult<RelationshipDto>> CreateRelationship(
        [Service] IMessageBus bus,
        CreateRelationshipInput input,
        CancellationToken cancellationToken)
    {
        var command = new CreateRelationshipCommand(
            input.TreeId,
            input.FromPersonId,
            input.ToPersonId,
            input.RelationshipType,
            ParseDate(input.StartDate),
            ParseDate(input.EndDate),
            input.Notes);

        var result = await bus.InvokeAsync<AppResult.Result<RelationshipDto>>(command, cancellationToken);
        
        return new MutationResult<RelationshipDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }

    /// <summary>
    /// Update a relationship's properties (dates, notes).
    /// </summary>
    public async Task<MutationResult<RelationshipDto>> UpdateRelationship(
        [Service] IMessageBus bus,
        UpdateRelationshipInput input,
        CancellationToken cancellationToken)
    {
        var command = new UpdateRelationshipCommand(
            input.Id,
            ParseDateForUpdate(input.StartDate),
            ParseDateForUpdate(input.EndDate),
            input.Notes);

        var result = await bus.InvokeAsync<AppResult.Result<RelationshipDto>>(command, cancellationToken);
        
        return new MutationResult<RelationshipDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }

    /// <summary>
    /// Delete a relationship.
    /// </summary>
    public async Task<MutationResult<bool>> DeleteRelationship(
        [Service] IMessageBus bus,
        string id,
        CancellationToken cancellationToken)
    {
        var result = await bus.InvokeAsync<AppResult.Result<bool>>(new DeleteRelationshipCommand(id), cancellationToken);
        
        return new MutationResult<bool>
        {
            Success = result.IsSuccess,
            Data = result.IsSuccess,
            Error = result.Error
        };
    }

    // ==================== Document Mutations ====================

    /// <summary>
    /// Add a document to a relationship.
    /// </summary>
    public async Task<MutationResult<RelationshipDto>> AddDocumentToRelationship(
        [Service] IMessageBus bus,
        AddDocumentInput input,
        CancellationToken cancellationToken)
    {
        var command = new AddDocumentToRelationshipCommand(
            input.RelationshipId,
            input.Name,
            input.Description,
            input.DocumentType,
            input.FileUrl,
            input.MimeType,
            input.FileSize);

        var result = await bus.InvokeAsync<AppResult.Result<RelationshipDto>>(command, cancellationToken);
        
        return new MutationResult<RelationshipDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }

    /// <summary>
    /// Remove a document from a relationship.
    /// </summary>
    public async Task<MutationResult<RelationshipDto>> RemoveDocumentFromRelationship(
        [Service] IMessageBus bus,
        string relationshipId,
        string documentId,
        CancellationToken cancellationToken)
    {
        var command = new RemoveDocumentFromRelationshipCommand(relationshipId, documentId);
        var result = await bus.InvokeAsync<AppResult.Result<RelationshipDto>>(command, cancellationToken);
        
        return new MutationResult<RelationshipDto>
        {
            Success = result.IsSuccess,
            Data = result.Value,
            Error = result.Error
        };
    }
    
    /// <summary>
    /// Parse date string for updates - returns MinValue for empty string (to clear), null if not provided.
    /// </summary>
    private static DateTime? ParseDateForUpdate(string? dateString)
    {
        if (dateString == null) return null; // Don't update
        if (string.IsNullOrEmpty(dateString)) return DateTime.MinValue; // Clear the field
        return DateTime.TryParse(dateString, out var date) ? date : null;
    }
}

// ==================== Input Types ====================

public class CreateTreeInput
{
    public string Name { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool? IsPublic { get; set; }
    public TreeLayout? DefaultLayout { get; set; }
}

public class UpdateTreeInput
{
    public string Id { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsPublic { get; set; }
    public string? RootPersonId { get; set; }
    public TreeLayout? DefaultLayout { get; set; }
    public bool? ShowPhotos { get; set; }
    public bool? ShowDates { get; set; }
    public string? ColorScheme { get; set; }
    public double? ZoomLevel { get; set; }
    public double? CenterX { get; set; }
    public double? CenterY { get; set; }
}

public class CreatePersonInput
{
    public string TreeId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public string? MaidenName { get; set; }
    public string? DateOfBirth { get; set; }
    public string? DateOfDeath { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? PlaceOfDeath { get; set; }
    public string? Biography { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Occupation { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public double? PositionX { get; set; }
    public double? PositionY { get; set; }
}

public class UpdatePersonInput
{
    public string Id { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? MaidenName { get; set; }
    public Gender? Gender { get; set; }
    public string? DateOfBirth { get; set; }
    public string? DateOfDeath { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? PlaceOfDeath { get; set; }
    public string? Biography { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Occupation { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public double? PositionX { get; set; }
    public double? PositionY { get; set; }
}

public class CreateRelationshipInput
{
    public string TreeId { get; set; } = string.Empty;
    public string FromPersonId { get; set; } = string.Empty;
    public string ToPersonId { get; set; } = string.Empty;
    public Domain.Entities.RelationshipType RelationshipType { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateRelationshipInput
{
    public string Id { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? Notes { get; set; }
}

public class AddDocumentInput
{
    public string RelationshipId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Domain.Entities.DocumentType DocumentType { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public long? FileSize { get; set; }
}

// ==================== Result Types ====================

public class MutationResult<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }
}
