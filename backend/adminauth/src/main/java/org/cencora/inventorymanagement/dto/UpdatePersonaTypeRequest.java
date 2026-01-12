package org.cencora.inventorymanagement.dto;

import org.cencora.inventorymanagement.enums.PersonaType;
import jakarta.validation.constraints.NotNull;

public class UpdatePersonaTypeRequest {
    
    @NotNull(message = "Persona type is required")
    private PersonaType personaType;
    
    // Getters and Setters
    public PersonaType getPersonaType() {
        return personaType;
    }
    
    public void setPersonaType(PersonaType personaType) {
        this.personaType = personaType;
    }
}
