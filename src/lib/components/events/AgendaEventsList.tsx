import { Fragment, MouseEvent, useState } from "react";
import {
  useTheme,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { format, isToday } from "date-fns";
import { ProcessedEvent } from "../../types";
import { getHourFormat } from "../../helpers/generals";
import useStore from "../../hooks/useStore";
import EventItemPopover from "./EventItemPopover";

interface AgendaEventsListProps {
  events: ProcessedEvent[];
}

const AgendaEventsList = ({ events }: AgendaEventsListProps) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ProcessedEvent>();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { locale, hourFormat, eventRenderer, onEventClick } = useStore();
  const theme = useTheme();
  const hFormat = getHourFormat(hourFormat);

  const triggerViewer = (el?: MouseEvent<Element>) => {
    if (!el?.currentTarget && deleteConfirm) {
      setDeleteConfirm(false);
    }
    setAnchorEl(el?.currentTarget || null);
  };

  return (
    <Fragment>
      <List>
        {events.map((event) => {
          const startIsToday = isToday(event.start);
          const startFormat = startIsToday ? hFormat : `MMM d, ${hFormat}`;
          const startDate = format(event.start, startFormat, {
            locale,
          });
          const endIsToday = isToday(event.end);
          const endFormat = endIsToday ? hFormat : `MMM d, ${hFormat}`;
          const endDate = format(event.end, endFormat, {
            locale,
          });

          if (typeof eventRenderer === "function") {
            return eventRenderer({ event, onClick: triggerViewer });
          }

          return (
            <ListItemButton
              key={`${event.start.getTime()}_${event.end.getTime()}_${event.event_id}`}
              disabled={event.disabled}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerViewer(e);
                setSelectedEvent(event);
                if (typeof onEventClick === "function") {
                  onEventClick(event);
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: event.disabled ? "#d0d0d0" : event.color || theme.palette.primary.main,
                    color: event.disabled
                      ? "#808080"
                      : event.textColor || theme.palette.primary.contrastText,
                  }}
                >
                  {" "}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={event.title} secondary={`${startDate} - ${endDate}`} />
            </ListItemButton>
          );
        })}
      </List>

      {/* Viewer */}
      {selectedEvent && (
        <EventItemPopover
          anchorEl={anchorEl}
          event={selectedEvent}
          onTriggerViewer={triggerViewer}
        />
      )}
    </Fragment>
  );
};

export default AgendaEventsList;
