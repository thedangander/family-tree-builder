using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.Persons.Commands;

/// <summary>
/// Command to update an existing person.
/// </summary>
public record UpdatePersonCommand(
    string Id,
    string? FirstName = null,
    string? LastName = null,
    string? MaidenName = null,
    Gender? Gender = null,
    DateTime? DateOfBirth = null,
    DateTime? DateOfDeath = null,
    string? PlaceOfBirth = null,
    string? PlaceOfDeath = null,
    string? Biography = null,
    string? PhotoUrl = null,
    string? Occupation = null,
    string? Email = null,
    string? Phone = null,
    double? PositionX = null,
    double? PositionY = null
);
