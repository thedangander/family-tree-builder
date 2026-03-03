using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Persons.Commands;

/// <summary>
/// Wolverine handler for CreatePersonCommand.
/// </summary>
public class CreatePersonHandler
{
    private readonly IPersonRepository _personRepository;
    private readonly ITreeRepository _treeRepository;

    public CreatePersonHandler(IPersonRepository personRepository, ITreeRepository treeRepository)
    {
        _personRepository = personRepository;
        _treeRepository = treeRepository;
    }

    public async Task<Result<PersonDto>> Handle(CreatePersonCommand command, CancellationToken cancellationToken)
    {
        // Validate tree exists
        var tree = await _treeRepository.GetByIdAsync(command.TreeId, cancellationToken);
        if (tree == null)
        {
            return Result<PersonDto>.Failure("Tree not found");
        }

        var person = new Person
        {
            TreeId = command.TreeId,
            FirstName = command.FirstName,
            LastName = command.LastName,
            MaidenName = command.MaidenName,
            Gender = command.Gender,
            DateOfBirth = command.DateOfBirth,
            DateOfDeath = command.DateOfDeath,
            PlaceOfBirth = command.PlaceOfBirth,
            PlaceOfDeath = command.PlaceOfDeath,
            Biography = command.Biography,
            PhotoUrl = command.PhotoUrl,
            Occupation = command.Occupation,
            Email = command.Email,
            Phone = command.Phone,
            PositionX = command.PositionX,
            PositionY = command.PositionY
        };

        var created = await _personRepository.CreateAsync(person, cancellationToken);
        return Result<PersonDto>.Success(created.ToDto());
    }
}
