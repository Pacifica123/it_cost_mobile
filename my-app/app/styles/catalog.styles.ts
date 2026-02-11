import { StyleSheet } from 'react-native';

export const exploreStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },

  addButton: { 
    backgroundColor: '#4CAF50', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15 
  },

  addButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },

  categoryContainer: { 
    marginBottom: 30 
  },

  categoryTitle: {
    textAlign: 'center', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },

  tableHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 5, 
    borderBottomWidth: 1, 
    borderColor: '#000' 
  },

  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderColor: '#ccc', 
    paddingHorizontal: 5 
  },

  cell: { 
    flex: 1, 
    textAlign: 'center' 
  },

  actionButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 10, 
    flexWrap: 'wrap' 
  },

  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },

  modal: { 
    backgroundColor: '#fff', 
    margin: 20, 
    borderRadius: 10, 
    padding: 20 
  },

  modalTitle: { 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },

  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginVertical: 5, 
    borderRadius: 5 
  },

  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
});
