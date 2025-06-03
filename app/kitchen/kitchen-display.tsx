import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  getActiveOrders,
  getOrdersByStatus,
  updateOrderStatus,
  Order,
  OrderStatus,
  sortOrders,
  isPrinterConnected,
  getPreparationTime,
  getPreparationTimeColor,
} from '../../lib/printer';

const STATUS_COLORS = {
  received: '#FFA500', // Orange
  preparing: '#FFD700', // Gold
  ready: '#32CD32', // Lime Green
  enRoute: '#1E90FF', // Dodger Blue
  delivered: '#808080', // Gray
};

const STATUS_ICONS = {
  received: 'receipt-outline',
  preparing: 'restaurant-outline',
  ready: 'checkmark-circle-outline',
  enRoute: 'car-outline',
  delivered: 'checkmark-done-outline',
};

type SortOption = 'time' | 'hole' | 'type';

export default function KitchenDisplay() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('time');
  const [isConnected, setIsConnected] = useState(isPrinterConnected());
  const [showSortModal, setShowSortModal] = useState(false);

  const loadOrders = () => {
    const activeOrders = getActiveOrders();
    setOrders(activeOrders);
  };

  useEffect(() => {
    loadOrders();
    // Refresh orders and printer status every 30 seconds
    const interval = setInterval(() => {
      loadOrders();
      setIsConnected(isPrinterConnected());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
    setRefreshing(false);
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    if (updateOrderStatus(orderId, newStatus)) {
      loadOrders();
    }
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : getOrdersByStatus(selectedStatus);

  const sortedOrders = sortOrders(filteredOrders, sortBy);

  const renderOrderCard = (order: Order) => {
    const statusColor = STATUS_COLORS[order.status];
    const statusIcon = STATUS_ICONS[order.status];
    const prepTime = getPreparationTime(order);

    return (
      <View key={order.id} style={[styles.orderCard, { borderLeftColor: statusColor }]}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <Text style={styles.playerName}>{order.playerName}</Text>
            <Text style={styles.hole}>Hole {order.hole}</Text>
          </View>
          <View style={styles.orderType}>
            <Ionicons
              name={order.orderType === 'pickup' ? 'walk-outline' : 'car-outline'}
              size={24}
              color="#666"
            />
            <Text style={styles.orderTypeText}>
              {order.orderType === 'pickup' ? 'Pickup' : 'Grab & Go'}
            </Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {order.items.map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.quantity}x {item.name}
            </Text>
          ))}
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.currentStatus}>
            <Ionicons name={statusIcon} size={20} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
            {prepTime !== null && (
              <View
                style={[
                  styles.prepTimeBadge,
                  { backgroundColor: getPreparationTimeColor(prepTime) },
                ]}
              >
                <Text style={styles.prepTimeText}>{prepTime}m</Text>
              </View>
            )}
          </View>

          <View style={styles.statusActions}>
            {order.status === 'received' && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: STATUS_COLORS.preparing }]}
                onPress={() => handleStatusUpdate(order.id, 'preparing')}
              >
                <Text style={styles.statusButtonText}>Start Preparing</Text>
              </TouchableOpacity>
            )}
            {order.status === 'preparing' && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: STATUS_COLORS.ready }]}
                onPress={() => handleStatusUpdate(order.id, 'ready')}
              >
                <Text style={styles.statusButtonText}>Mark Ready</Text>
              </TouchableOpacity>
            )}
            {order.status === 'ready' && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: STATUS_COLORS.enRoute }]}
                onPress={() => handleStatusUpdate(order.id, 'enRoute')}
              >
                <Text style={styles.statusButtonText}>Start Delivery</Text>
              </TouchableOpacity>
            )}
            {order.status === 'enRoute' && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: STATUS_COLORS.delivered }]}
                onPress={() => handleStatusUpdate(order.id, 'delivered')}
              >
                <Text style={styles.statusButtonText}>Mark Delivered</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort Orders</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSortModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {(['time', 'hole', 'type'] as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortOption,
                sortBy === option && styles.sortOptionSelected,
              ]}
              onPress={() => {
                setSortBy(option);
                setShowSortModal(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option && styles.sortOptionTextSelected,
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
              {sortBy === option && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Kitchen Display</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="funnel-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/kitchen/printer-settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.printerStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#32CD32' : '#FF4500' },
            ]}
          />
          <Text style={styles.statusText}>
            Printer {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        <View style={styles.statusFilter}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStatus === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          {Object.keys(STATUS_COLORS).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                selectedStatus === status && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(status as OrderStatus)}
            >
              <Text style={styles.filterButtonText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.ordersContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No active orders</Text>
          </View>
        ) : (
          sortedOrders.map(renderOrderCard)
        )}
      </ScrollView>

      {renderSortModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  sortButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  printerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  statusFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  ordersContainer: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  hole: {
    fontSize: 14,
    color: '#666',
  },
  orderType: {
    alignItems: 'center',
  },
  orderTypeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  prepTimeBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  prepTimeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sortOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  sortOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
}); 