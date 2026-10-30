import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Language } from "../interfaces";
import { detectInitialLanguage, saveLanguage } from "../utils/language";

export function useGetLanguage() {
  const query = useQuery({
    queryKey: ["language"],
    queryFn: () => detectInitialLanguage(),
  });
  // Keep <html lang> in step with the chosen language.
  useEffect(() => {
    if (query.data) document.documentElement.lang = query.data;
  }, [query.data]);
  return query;
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["language"],
    mutationFn: (request: Language) => {
      // Blocked storage still switches the language for this session.
      saveLanguage(request);
      queryClient.setQueryData(["language"], request);
      return Promise.resolve(request); // Ensure it returns a Promise
    },
  });
}
