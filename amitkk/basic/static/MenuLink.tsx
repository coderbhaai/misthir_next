import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useState, useEffect } from "react";
import { getLayoutLinks } from "../utils/utils";
import { useAuth } from "contexts/AuthContext";

export default function MenuLink() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { onLogin, onLogout } = useAuth();
  const [open, setOpen] = useState(true);
  const [submenuOpen, setSubmenuOpen] = useState<{ [key: string]: boolean }>({});
  const [menu, setMenu] = useState<any[]>([]);
  const [userLinks, setUserLinks] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchMenu() {
      const data = await getLayoutLinks();
      setMenu(data.adminLinks);
      setUserLinks(data.userSubmenus);
    }

    fetchMenu();

    const unsubscribeLogin = onLogin(() => {
      fetchMenu();
    });
    
    const unsubscribeLogout = onLogout(() => {
      setMenu([]);
      setUserLinks([]);
      setSubmenuOpen({});
    });
    
    return () => {
      unsubscribeLogin();
      unsubscribeLogout();
    };
  }, []);

  const handleSubmenuToggle = (name: string) => {
    setSubmenuOpen((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  if (!mounted) return null;
  
  return(
    <List>
      {menu?.map((item) => (
        <div key={item.name}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => item.children && handleSubmenuToggle(item.name)}>
              {item.media && (
                <img src={item.media} alt={item.name} style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%", marginRight: 8, }}/>
              )}
              {open && <ListItemText primary={item.name} />}
              {open && item.children && (submenuOpen[item.name] ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </ListItem>
        
            {item.children && open && (
              <Collapse in={submenuOpen[item.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children?.map((child: { name: string; url?: string, media?:string }) => (
                    <List key={`${item.name}-${child.url || child.name}`}>
                      <ListItem component="a" href={child.url} sx={{ pl: 4 }}>
                        {child.media && (
                          <img src={child.media} alt={child.name} style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%", marginRight: 8, }}/>
                        )}
                        <ListItemText primary={child.name} />
                      </ListItem>
                    </List>
                  ))}
                </List>
              </Collapse>
            )}
        </div>
      ))}

      {userLinks?.map((i) => (
        <div key={i._id as string}>
          <List key={`${i.name}-${i.url || i.name}`}>
            <ListItem component="a" href={i.url}>
              {i.media && (
                <img src={i.media} alt={i.name} style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%", marginRight: 8, }}/>
              )}
              <ListItemText primary={i.name} />
            </ListItem>
          </List>
        </div>
      ))}
    </List>
  );
}