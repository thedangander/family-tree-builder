import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Avatar, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { Person, Gender } from '../types';

export type HandlePosition = 'top' | 'bottom' | 'left' | 'right';

interface PersonNodeData {
  person: Person;
  onHandleClick?: (personId: string, position: HandlePosition) => void;
  onHover?: (personId: string | null) => void;
  isDimmed?: boolean;
}

export const PersonNode = memo(({ data, id }: NodeProps<PersonNodeData>) => {
  const { person, onHandleClick, onHover, isDimmed } = data;

  const getBackgroundColor = () => {
    switch (person.gender) {
      case Gender.MALE:
        return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      case Gender.FEMALE:
        return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)';
      default:
        return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
    }
  };

  const handleClick = useCallback(
    (position: HandlePosition) => (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent node selection
      if (onHandleClick) {
        onHandleClick(id, position);
      }
    },
    [id, onHandleClick]
  );

  // Custom handle component with click handler and hover effects
  const ClickableHandle = ({
    position,
    type,
    handleId,
    tooltip,
  }: {
    position: Position;
    type: 'source' | 'target';
    handleId: string;
    tooltip?: string;
  }) => {
    const positionKey = position.toLowerCase() as HandlePosition;

    return (
      <Tooltip title={tooltip || `Add ${positionKey === 'top' ? 'parent' : positionKey === 'bottom' ? 'child' : 'spouse'}`} placement={positionKey}>
        <Box
          onClick={handleClick(positionKey)}
          sx={{
            position: 'absolute',
            ...(position === Position.Top && { top: -6, left: '50%', transform: 'translateX(-50%)' }),
            ...(position === Position.Bottom && { bottom: -6, left: '50%', transform: 'translateX(-50%)' }),
            ...(position === Position.Left && { left: -6, top: '50%', transform: 'translateY(-50%)' }),
            ...(position === Position.Right && { right: -6, top: '50%', transform: 'translateY(-50%)' }),
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#94a3b8',
            border: '2px solid white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            '&:hover': {
              background: '#6366f1',
              transform: position === Position.Top || position === Position.Bottom
                ? 'translateX(-50%) scale(1.5)'
                : 'translateY(-50%) scale(1.5)',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            },
            '&:hover .add-icon': {
              opacity: 1,
            },
          }}
        >
          <AddIcon
            className="add-icon"
            sx={{
              fontSize: 10,
              color: 'white',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
          />
          <Handle
            type={type}
            position={position}
            id={handleId}
            style={{ 
              opacity: 0, 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        </Box>
      </Tooltip>
    );
  };

  const handleMouseEnter = useCallback(() => {
    if (onHover) {
      onHover(id);
    }
  }, [id, onHover]);

  const handleMouseLeave = useCallback(() => {
    if (onHover) {
      onHover(null);
    }
  }, [onHover]);

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        background: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: 2,
        minWidth: 180,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '2px solid transparent',
        position: 'relative',
        opacity: isDimmed ? 0.25 : 1,
        filter: isDimmed ? 'grayscale(50%)' : 'none',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: isDimmed ? 'none' : 'translateY(-2px)',
        },
      }}
    >
      {/* Clickable handles with visual feedback */}
      <ClickableHandle position={Position.Top} type="source" handleId="top" tooltip="Add parent" />
      <ClickableHandle position={Position.Bottom} type="source" handleId="bottom" tooltip="Add child" />
      <ClickableHandle position={Position.Left} type="source" handleId="left" tooltip="Add spouse" />
      <ClickableHandle position={Position.Right} type="source" handleId="right" tooltip="Add spouse" />
      
      {/* Hidden target handles for edge connections */}
      <Handle type="target" position={Position.Top} id="top-target" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ opacity: 0, pointerEvents: 'none' }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src={person.photoUrl || undefined}
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            background: getBackgroundColor(),
          }}
        >
          <PersonIcon />
        </Avatar>
        <Box sx={{ minWidth: 0, maxWidth: 200, overflow: 'hidden' }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              color: '#1a1a2e',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={person.fullName}
          >
            {person.fullName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {person.dateOfBirth && (
              <Typography variant="caption" color="text.secondary">
                {new Date(person.dateOfBirth).getFullYear()}
                {person.dateOfDeath && ` - ${new Date(person.dateOfDeath).getFullYear()}`}
              </Typography>
            )}
            {person.age !== undefined && person.age !== null && (
              <Typography
                variant="caption"
                sx={{
                  ml: person.dateOfBirth ? 0.5 : 0,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: person.isAlive ? 'success.light' : 'grey.300',
                  color: person.isAlive ? 'success.dark' : 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                }}
              >
                {person.age}y
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

PersonNode.displayName = 'PersonNode';
