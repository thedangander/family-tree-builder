using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.Persons.Commands;

/// <summary>
/// Command to create a new person in a family tree.
/// </summary>
public record CreatePersonCommand(
    string TreeId,
    string FirstName,
    string LastName,
    Gender Gender,
    string? MaidenName = null,
    DateTime? DateOfBirth = null,
    DateTime? DateOfDeath = null,
    string? PlaceOfBirth = null,
    string? PlaceOfDeath = null,
    string? Biography = null,
    string? PhotoUrl = null,
    string? Occupation = null,
    string? Email = null,
    string? Phone = null,
    double PositionX = 0,
    double PositionY = 0
);
