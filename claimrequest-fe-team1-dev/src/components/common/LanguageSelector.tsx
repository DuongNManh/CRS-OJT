import { JapanFlag, UsaFlag, VietnamFlag } from "@/data/CustomIcons";
import {
  Box,
  ListItemIcon,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from "@mui/material";
import { useLanguage } from "../../hooks/useLanguage";

const languages: { [key: string]: { name: string; icon: JSX.Element } } = {
  vi: { name: "VN", icon: <VietnamFlag /> },
  en: { name: "ENG", icon: <UsaFlag /> },
  jp: { name: "JP", icon: <JapanFlag /> },
};

interface Props {
  isDarkMode?: boolean;
}

const LanguageSelector: React.FC<Props> = ({ isDarkMode = true }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newLang = event.target.value;
    changeLanguage(newLang);
  };

  return (
    <Select
      value={currentLanguage}
      onChange={handleChange}
      displayEmpty
      renderValue={(selected: string) => (
        <Box
          display="flex"
          alignItems="center"
          sx={{
            gap: 1,
            color: isDarkMode
              ? theme.palette.common.white
              : theme.palette.text.primary,
          }}
        >
          {languages[selected]?.icon} {languages[selected]?.name}
        </Box>
      )}
      sx={{
        backgroundColor: "transparent",
        minWidth: "60px",
        maxHeight: "40px",
        borderRadius: "8px",
        boxShadow: isDarkMode ? "none" : theme.shadows[1],
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "&:hover": {
          backgroundColor: isDarkMode
            ? theme.palette.action.hover
            : theme.palette.action.selected,
        },
        "&.Mui-focused": {
          backgroundColor: isDarkMode
            ? theme.palette.action.hover
            : theme.palette.action.selected,
        },
      }}
    >
      {Object.entries(languages).map(([code, { name, icon }]) => (
        <MenuItem
          key={code}
          value={code}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <Typography>{name}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

export default LanguageSelector;
