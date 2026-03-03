using FamilyTree.Application.Common;
using FamilyTree.Application.DTOs;
using FamilyTree.Domain.Interfaces;

namespace FamilyTree.Application.Trees.Commands;

/// <summary>
/// Wolverine handler for UpdateTreeCommand.
/// </summary>
public class UpdateTreeHandler
{
    private readonly ITreeRepository _treeRepository;

    public UpdateTreeHandler(ITreeRepository treeRepository)
    {
        _treeRepository = treeRepository;
    }

    public async Task<Result<TreeDto>> Handle(UpdateTreeCommand command, CancellationToken cancellationToken)
    {
        var tree = await _treeRepository.GetByIdAsync(command.Id, cancellationToken);
        if (tree == null)
        {
            return Result<TreeDto>.Failure("Tree not found");
        }

        // Apply updates only for non-null values
        if (command.Name != null) tree.Name = command.Name;
        if (command.Description != null) tree.Description = command.Description;
        if (command.IsPublic.HasValue) tree.IsPublic = command.IsPublic.Value;
        if (command.RootPersonId != null) tree.RootPersonId = command.RootPersonId;
        
        // Settings updates
        if (command.DefaultLayout.HasValue) tree.Settings.DefaultLayout = command.DefaultLayout.Value;
        if (command.ShowPhotos.HasValue) tree.Settings.ShowPhotos = command.ShowPhotos.Value;
        if (command.ShowDates.HasValue) tree.Settings.ShowDates = command.ShowDates.Value;
        if (command.ColorScheme != null) tree.Settings.ColorScheme = command.ColorScheme;
        if (command.ZoomLevel.HasValue) tree.Settings.ZoomLevel = command.ZoomLevel.Value;
        if (command.CenterX.HasValue) tree.Settings.CenterX = command.CenterX.Value;
        if (command.CenterY.HasValue) tree.Settings.CenterY = command.CenterY.Value;

        tree.UpdatedAt = DateTime.UtcNow;

        var updated = await _treeRepository.UpdateAsync(tree, cancellationToken);
        return Result<TreeDto>.Success(updated.ToDto());
    }
}
