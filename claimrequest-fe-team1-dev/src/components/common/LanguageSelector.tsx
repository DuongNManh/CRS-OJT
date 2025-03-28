import { JapanFlag, UsaFlag, VietnamFlag } from "@/data/CustomIcons";
import {
  Box,
  ListItemIcon,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
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
            color: isDarkMode ? "white" : "black",
          }}
        >
          {languages[selected]?.icon} {languages[selected]?.name}
        </Box>
      )}
      sx={{
        backgroundColor: isDarkMode ? "transparent" : "#f1f1f1",
        minWidth: isDarkMode ? "50px" : "30px",
        border: "none",
        boxShadow: "none",
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
      }}
    >
      {Object.entries(languages).map(([code, { name, icon }]) => (
        <MenuItem key={code} value={code}>
          <ListItemIcon>{icon}</ListItemIcon>
          <Typography>{name}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

export default LanguageSelector;
